import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Dimensions,
  Alert,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

interface MarkdownFieldProps {
  labeltring;
  valuetring;
  onChange: (valuetring) => void;
  required?oolean;
  placeholder?tring;
  helperText?tring;
  height?umber;
}

interface MarkdownCommand {
  icontring;
  labeltring;
  action: (
    texttring,
    selection: { startumber; endumber },
  ) => {
    texttring;
    selection: { startumber; endumber };
  };
}

const colors = {
  primary: "#8B7355",
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

const markdownCommandsarkdownCommand[] = [
  {
    icon: "format-bold",
    label: "Bold",
    action: (text, selection) => {
      const selectedText = text.substring(selection.start, selection.end);
      if (selectedText) {
        const before = text.substring(0, selection.start);
        const after = text.substring(selection.end);
        const formattedText = `${before}**${selectedText}**${after}`;
        return {
          textormattedText,
          selection: { startelection.start + 2, endelection.end + 2 },
        };
      } else {
        const before = text.substring(0, selection.start);
        const after = text.substring(selection.start);
        const formattedText = `${before}****${after}`;
        return {
          textormattedText,
          selection: { startelection.start + 2, endelection.start + 2 },
        };
      }
    },
  },
  {
    icon: "format-italic",
    label: "Italic",
    action: (text, selection) => {
      const selectedText = text.substring(selection.start, selection.end);
      if (selectedText) {
        const before = text.substring(0, selection.start);
        const after = text.substring(selection.end);
        const formattedText = `${before}_${selectedText}_${after}`;
        return {
          textormattedText,
          selection: { startelection.start + 1, endelection.end + 1 },
        };
      } else {
        const before = text.substring(0, selection.start);
        const after = text.substring(selection.start);
        const formattedText = `${before}__${after}`;
        return {
          textormattedText,
          selection: { startelection.start + 1, endelection.start + 1 },
        };
      }
    },
  },
  {
    icon: "format-strikethrough",
    label: "Strikethrough",
    action: (text, selection) => {
      const selectedText = text.substring(selection.start, selection.end);
      if (selectedText) {
        const before = text.substring(0, selection.start);
        const after = text.substring(selection.end);
        const formattedText = `${before}~~${selectedText}~~${after}`;
        return {
          textormattedText,
          selection: { startelection.start + 2, endelection.end + 2 },
        };
      } else {
        const before = text.substring(0, selection.start);
        const after = text.substring(selection.start);
        const formattedText = `${before}~~~~${after}`;
        return {
          textormattedText,
          selection: { startelection.start + 2, endelection.start + 2 },
        };
      }
    },
  },
  {
    icon: "format-list-bulleted",
    label: "Bullet List",
    action: (text, selection) => {
      const lines = text.split("\n");
      let currentLine = 0;
      let currentPos = 0;

      // Find which line the cursor is on
      for (let i = 0; i < lines.length; i++) {
        if (currentPos + lines[i].length >= selection.start) {
          currentLine = i;
          break;
        }
        currentPos += lines[i].length + 1; // +1 for newline
      }

      // Add bullet point to current line
      if (!lines[currentLine].trim().startsWith("- ")) {
        lines[currentLine] = "- " + lines[currentLine];
      }

      const newText = lines.join("\n");
      return {
        textewText,
        selection: { startelection.start + 2, endelection.end + 2 },
      };
    },
  },
  {
    icon: "format-list-numbered",
    label: "Numbered List",
    action: (text, selection) => {
      const lines = text.split("\n");
      let currentLine = 0;
      let currentPos = 0;

      // Find which line the cursor is on
      for (let i = 0; i < lines.length; i++) {
        if (currentPos + lines[i].length >= selection.start) {
          currentLine = i;
          break;
        }
        currentPos += lines[i].length + 1; // +1 for newline
      }

      // Add numbered point to current line
      if (!lines[currentLine].trim().match(/^\d+\.\s/)) {
        lines[currentLine] = "1. " + lines[currentLine];
      }

      const newText = lines.join("\n");
      return {
        textewText,
        selection: { startelection.start + 3, endelection.end + 3 },
      };
    },
  },
  {
    icon: "link",
    label: "Link",
    action: (text, selection) => {
      const selectedText = text.substring(selection.start, selection.end);
      const linkText = selectedText || "link text";
      const before = text.substring(0, selection.start);
      const after = text.substring(selection.end);
      const formattedText = `${before}[${linkText}](url)${after}`;
      return {
        textormattedText,
        selection: {
          startelection.start + linkText.length + 3,
          endelection.start + linkText.length + 6,
        },
      };
    },
  },
  {
    icon: "code",
    label: "Code",
    action: (text, selection) => {
      const selectedText = text.substring(selection.start, selection.end);
      if (selectedText) {
        const before = text.substring(0, selection.start);
        const after = text.substring(selection.end);
        const formattedText = `${before}\`${selectedText}\`${after}`;
        return {
          textormattedText,
          selection: { startelection.start + 1, endelection.end + 1 },
        };
      } else {
        const before = text.substring(0, selection.start);
        const after = text.substring(selection.start);
        const formattedText = `${before}\`\`${after}`;
        return {
          textormattedText,
          selection: { startelection.start + 1, endelection.start + 1 },
        };
      }
    },
  },
];

export const MarkdownField= ({
  label,
  value,
  onChange,
  required = false,
  placeholder,
  helperText,
  height = 200,
}) => {
  const [showToolbar, setShowToolbar] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selection, setSelection] = useState({ start, end });
  const [isFocused, setIsFocused] = useState(false);

  const handleSelectionChange = (eventny) => {
    const { start, end } = event.nativeEvent.selection;
    setSelection({ start, end });
  };

  const applyMarkdown = (commandarkdownCommand) => {
    const result = command.action(value, selection);
    onChange(result.text);
    setSelection(result.selection);
    setShowToolbar(false);
  };

  // Simple markdown preview renderer
  const renderPreview = (texttring) => {
    if (!text) return "Preview will appear here...";

    // Basic markdown parsing for display
    return text
      .replace(/\*\*(.*?)\*\*/g, "[$1]") // Bold
      .replace(/_(.*?)_/g, "/$1/") // Italic
      .replace(/~~(.*?)~~/g, "-$1-") // Strikethrough
      .replace(/`(.*?)`/g, '"$1"') // Code
      .replace(/\[(.*?)\]\((.*?)\)/g, "$1 ($2)") // Links
      .replace(/^- (.+)$/gm, "• $1") // Bullet points
      .replace(/^(\d+)\. (.+)$/gm, "$1. $2"); // Numbered lists
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text
          style={[
            styles.label,
            { colorsFocused ? colors.primary olors.text },
          ]}
        >
          {label}
          {required  <Text style={styles.required}> *</Text>}
        </Text>

        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.headerButton, showToolbar  styles.activeButton]}
            onPress={() => setShowToolbar(!showToolbar)}
          >
            <Icon
              name="format-size"
              size={18}
              color={showToolbar ? colors.white olors.primary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.headerButton, showPreview  styles.activeButton]}
            onPress={() => setShowPreview(!showPreview)}
          >
            <Icon
              name="visibility"
              size={18}
              color={showPreview ? colors.white olors.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Toolbar */}
      {showToolbar  (
        <View style={styles.toolbar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.toolbarContent}
          >
            {markdownCommands.map((command, index) => (
              <TouchableOpacity
                key={index}
                style={styles.toolbarButton}
                onPress={() => applyMarkdown(command)}
              >
                <Icon name={command.icon} size={20} color={colors.primary} />
                <Text style={styles.toolbarButtonText}>{command.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.editorContainer}>
        {/* Editor */}
        <View
          style={[
            styles.editorPanel,
            { displayhowPreview ? "none" : "flex" },
            { borderColorsFocused ? colors.primary olors.border },
          ]}
        >
          <TextInput
            style={[styles.textInput, { height: 2 }]}
            value={value}
            onChangeText={onChange}
            onSelectionChange={handleSelectionChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder || `Enter ${label.toLowerCase()}...`}
            placeholderTextColor={colors.textSecondary}
            multiline
            textAlignVertical="top"
            selectionColor={colors.primary}
          />
        </View>

        {/* Preview */}
        {showPreview  (
          <View style={[styles.previewPanel, { height: 2 }]}>
            <ScrollView style={styles.previewScroll}>
              <Text style={styles.previewText}>{renderPreview(value)}</Text>
            </ScrollView>
          </View>
        )}
      </View>

      {/* Helper Text */}
      {helperText  (
        <Text style={styles.helperText}>Example: {helperText}</Text>
      )}

      {/* Help Modal */}
      <Modal visible={false} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.helpModal}>
            <Text style={styles.helpTitle}>Markdown Help</Text>
            <ScrollView style={styles.helpContent}>
              <Text style={styles.helpText}>
                **Bold** or __Bold__{"\n"}
                *Italic* or _Italic_{"\n"}
                ~~Strikethrough~~{"\n"}
                `Code`{"\n"}
                [Link](url){"\n"}- Bullet list{"\n"}
                1. Numbered list{"\n"}# Heading
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
  },
  required: {
    color: colors.error,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 8,
  },
  headerButton: {
    paddingHorizontal,
    paddingVertical,
    borderRadius: 6,
    backgroundColor: colors.surface,
  },
  activeButton: {
    backgroundColor: colors.primary,
  },
  toolbar: {
    backgroundColor: colors.hover,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toolbarContent: {
    paddingHorizontal: 2,
    paddingVertical,
  },
  toolbarButton: {
    alignItems: "center",
    paddingHorizontal: 2,
    paddingVertical,
    marginHorizontal,
    borderRadius: 8,
    minWidth0,
  },
  toolbarButtonText: {
    fontSize: 10,
    color: colors.text,
    marginTop: 8,
    textAlign: "center",
  },
  editorContainer: {
    borderRadius: 8,
    overflow: "hidden",
  },
  editorPanel: {
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: colors.white,
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
  previewPanel: {
    backgroundColor: colors.hover,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 60,
  },
  previewScroll: {
    flex: 1,
  },
  previewText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
  },
  helperText: {
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
  helpModal: {
    backgroundColor: colors.white,
    borderRadius: 2,
    margin: 00,
    maxWidthimensions.get("window").width - 40,
    maxHeightimensions.get("window").height * 0.6,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColorolors.border,
  },
  helpContent: {
    padding: 60,
  },
  helpText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
});
