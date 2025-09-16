import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Modal,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { getTextStyle } from "../../utils/platformStyles";
import { isAndroid } from "../../utils/platform";

// Interface definitions removed - using plain JavaScript

const formatButtons = [
  {
    icon: "format-bold",
    tooltip: "Bold",
    markdown: { prefix: "**", suffix: "**" },
  },
  {
    icon: "format-italic",
    tooltip: "Italic",
    markdown: { prefix: "_", suffix: "_" },
  },
  {
    icon: "format-list-bulleted",
    tooltip: "Bullet List",
    markdown: { prefix: "- ", suffix: "" },
  },
  {
    icon: "link",
    tooltip: "Link",
    markdown: { prefix: "[", suffix: "](url)" },
  },
  {
    icon: "code",
    tooltip: "Code",
    markdown: { prefix: "`", suffix: "`" },
  },
];

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
  success: "#2E7D32",
  hover: "#F5F5F5",
};

export const SmartTextInput = ({
  label,
  value,
  onChange,
  placeholder,
  helperText,
  required = false,
  multiline = true,
  rows = 3,
  maxRows = 10,
  autoFocus = false,
}) => {
  const textInputRef = useRef(null);
  const [showFormatting, setShowFormatting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  // Check if text has formatting
  useEffect(() => {
    const hasFormatting = /\*\*.*?\*\*|_.*?_|`.*?`|\[.*?\]\(.*?\)/.test(value);
    setShowPreview(hasFormatting && multiline);
  }, [value, multiline]);

  const handleChange = (newValue) => {
    // Check for auto-formatting triggers
    if (newValue.endsWith("  ")) {
      // Double space triggers new paragraph
      const formattedValue = newValue.trim() + "\n\n";
      onChange(formattedValue);
    } else {
      onChange(newValue);
    }
  };

  const handleSelectionChange = (event) => {
    const { start, end } = event.nativeEvent.selection;
    setSelectionStart(start);
    setSelectionEnd(end);
  };

  // Apply formatting to selected text
  const applyFormat = (format) => {
    if (!textInputRef.current) return;

    const start = selectionStart;
    const end = selectionEnd;
    const selectedText = value.substring(start, end);

    if (selectedText) {
      const before = value.substring(0, start);
      const formatted = `${format.markdown.prefix}${selectedText}${format.markdown.suffix}`;

      const newValue = before + formatted + value.substring(end);
      onChange(newValue);

      // Reset selection
      setTimeout(() => {
        if (textInputRef.current) {
          const newCursorPos = start + formatted.length;
          textInputRef.current.setNativeProps({
            selection: { start: newCursorPos, end: newCursorPos },
          });
        }
      }, 100);
    } else if (format.markdown.prefix === "- ") {
      // For list, add at start of current line
      const before = value.substring(0, start);
      const lastNewline = before.lastIndexOf("\n");
      const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;

      const newValue =
        value.substring(0, lineStart) + "- " + value.substring(lineStart);

      onChange(newValue);
    }

    setShowFormatting(false);
  };

  // Parse markdown-like syntax for preview
  const parseFormatting = (text) => {
    if (!text) return text;

    // Simple text-only parsing for preview
    return text
      .replace(/\*\*(.*?)\*\*/g, "[$1]") // Bold
      .replace(/_(.*?)_/g, "/$1/") // Italic
      .replace(/`(.*?)`/g, '"$1"') // Code
      .replace(/\[(.*?)\]\((.*?)\)/g, "$1 ($2)"); // Links
  };

  const minHeight = multiline ? rows * 20 + 20 : 0;
  const maxHeight = multiline ? maxRows * 20 + 20 : 0;

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.label,
          { color: isFocused ? colors.primary : colors.text },
        ]}
      >
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      {/* Preview */}
      {showPreview && (
        <View style={styles.previewContainer}>
          <Text style={styles.previewLabel}>Preview:</Text>
          <Text style={styles.previewText}>{parseFormatting(value)}</Text>
        </View>
      )}

      {/* Text Input */}
      <View
        style={[
          styles.inputContainer,
          { borderColor: isFocused ? colors.primary : colors.border },
        ]}
      >
        <TextInput
          ref={textInputRef}
          style={[
            styles.textInput,
            {
              minHeight,
              maxHeight: multiline ? maxHeight : minHeight,
              textAlignVertical: multiline ? "top" : "center",
            },
            getTextStyle("input"), // Force black text on Android
            isAndroid && { color: "#000000" }, // Extra insurance
          ]}
          value={value}
          onChangeText={handleChange}
          onSelectionChange={handleSelectionChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          placeholderTextColor={isAndroid ? "#999" : colors.textSecondary}
          multiline={multiline}
          numberOfLines={multiline ? rows : 1}
          autoFocus={autoFocus}
          selectionColor={colors.primary}
        />

        {/* Format button for selected text */}
        {isFocused && selectionEnd > selectionStart && (
          <TouchableOpacity
            style={styles.formatToggle}
            onPress={() => setShowFormatting(true)}
          >
            <Icon name="format-size" size={20} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Helper Text */}
      {Boolean(helperText) && <Text style={styles.helperText}>{helperText}</Text>}

      {/* Tips */}
      {value.length < 1 && !isFocused && (
        <Text style={styles.tipText}>
          Tipse **text** for bold, _text_ for italic, - for lists
        </Text>
      )}

      {/* Formatting Modal */}
      <Modal
        visible={showFormatting}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFormatting(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowFormatting(false)}
        >
          <View style={styles.formatToolbar}>
            <Text style={styles.toolbarTitle}>Format Text</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.formatButtons}
            >
              {formatButtons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.formatButton}
                  onPress={() => applyFormat(button)}
                >
                  <Icon name={button.icon} size={24} color={colors.primary} />
                  <Text style={styles.formatButtonText}>{button.tooltip}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeFormatting}
              onPress={() => setShowFormatting(false)}
            >
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  required: {
    color: colors.error,
  },
  previewContainer: {
    backgroundColor: colors.hover,
    borderRadius: 8,
    padding: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  previewText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: colors.white,
    position: "relative",
  },
  textInput: {
    fontSize: 16,
    color: colors.text,
    paddingHorizontal: 6,
    paddingVertical: 2,
    lineHeight: 22,
    ...Platform.select({
      ios: {
        paddingTop: 2,
      },
      android: {
        paddingTop: 8,
      },
    }),
  },
  formatToggle: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: colors.surface,
    borderRadius: 6,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  helperText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  tipText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    fontStyle: "italic",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  formatToolbar: {
    backgroundColor: colors.white,
    borderRadius: 2,
    margin: 20,
    maxWidth: Dimensions.get("window").width - 40,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  toolbarTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  formatButtons: {
    flexDirection: "row",
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  formatButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    minWidth: 50,
  },
  formatButtonText: {
    fontSize: 12,
    color: colors.text,
    marginTop: 8,
    textAlign: "center",
  },
  closeFormatting: {
    alignSelf: "center",
    padding: 16,
  },
});
