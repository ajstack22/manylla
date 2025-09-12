import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Modal,
  StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useTheme } from "../../context/ThemeContext";
import { MarkdownField } from "../Forms/MarkdownField";
import { getScrollViewProps, getTextStyle } from "../../utils/platformStyles";
import platform from "@platform";

const predefinedQuickInfoOptions = [
  "Communication",
  "Sensory",
  "Medical",
  "Dietary",
  "Emergency",
  "Medications",
  "Allergies",
  "Behaviors",
  "Triggers",
  "Calming Strategies",
  "Sleep",
  "Daily Routine",
  "Custom...",
];

const defaultColors = [
  "#E74C3C",
  "#3498DB",
  "#2ECC71",
  "#F39C12",
  "#9B59B6",
  "#1ABC9C",
  "#E67E22",
  "#34495E",
  "#16A085",
  "#27AE60",
  "#8E44AD",
  "#2980B9",
];

export const UnifiedAddDialog = ({
  open,
  onClose,
  mode,
  onAdd,
  existingItems = [],
}) => {
  const { theme } = useTheme();
  const isWeb = platform.isWeb;

  // Quick Info state
  const [selectedOption, setSelectedOption] = useState("");
  const [customName, setCustomName] = useState("");
  const [value, setValue] = useState("");
  const [privacyLevel, setPrivacyLevel] = useState("all");

  // Category state
  const [categoryName, setCategoryName] = useState("");
  const [categoryColor, setCategoryColor] = useState("#3498DB");
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleReset = () => {
    setSelectedOption("");
    setCustomName("");
    setValue("");
    setPrivacyLevel("all");
    setCategoryName("");
    setCategoryColor("#3498DB");
    setShowColorPicker(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleAdd = () => {
    if (mode === "quickInfo") {
      const displayName =
        selectedOption === "Custom..." ? customName : selectedOption;
      const name = displayName.toLowerCase().replace(/\s+/g, "-");

      if (displayName && value) {
        onAdd({
          id: `custom-${Date.now()}`,
          name,
          displayName,
          value,
          order: existingItems.length + 1,
          isVisible: true,
          isCustom: true,
        });
        handleClose();
      }
    } else {
      if (categoryName && categoryColor) {
        onAdd({
          id: `custom-${Date.now()}`,
          name: categoryName.toLowerCase().replace(/\s+/g, "-"),
          displayName: categoryName,
          color: categoryColor,
          order: existingItems.length + 1,
          isVisible: true,
          isCustom: true,
        });
        handleClose();
      }
    }
  };

  const isValid =
    mode === "quickInfo"
      ? selectedOption &&
        (selectedOption !== "Custom..." || customName) &&
        value
      : categoryName && categoryColor;

  const privacyLevels = ["private", "family", "medical", "education", "all"];

  const styles = StyleSheet.create({
    modal: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text,
    },
    closeButton: {
      padding: 8,
    },
    closeButtonText: {
      fontSize: 16,
      color: theme.colors.text,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    inputContainer: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.colors.text,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: theme.colors.text,
      backgroundColor: theme.colors.surface,
    },
    picker: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      backgroundColor: theme.colors.surface,
    },
    privacyContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    privacyButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    privacyButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    privacyButtonText: {
      fontSize: 14,
      color: theme.colors.text,
    },
    privacyButtonTextActive: {
      color: "#FFFFFF",
    },
    colorGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      marginTop: 8,
    },
    colorSwatch: {
      width: 40,
      height: 40,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    colorSwatchSelected: {
      borderWidth: 3,
      borderColor: theme.colors.text,
    },
    customColorButton: {
      width: 40,
      height: 40,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      justifyContent: "center",
      alignItems: "center",
      background: "linear-gradient(45deg, #ff0000, #00ff00, #0000ff)",
    },
    customColorText: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.colors.text,
    },
    colorPickerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginTop: 12,
    },
    colorInput: {
      flex: 1,
    },
    preview: {
      padding: 16,
      borderRadius: 8,
      marginTop: 16,
      alignItems: "center",
    },
    previewText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "500",
    },
    footer: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 12,
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    button: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
    },
    cancelButton: {
      backgroundColor: "transparent",
    },
    cancelButtonText: {
      color: theme.colors.text,
      fontSize: 16,
    },
    addButton: {
      backgroundColor: theme.colors.primary,
    },
    addButtonDisabled: {
      backgroundColor: theme.colors.disabled,
    },
    addButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "500",
    },
  });

  return (
    <Modal
      visible={open}
      onRequestClose={handleClose}
      animationType="slide"
      presentationStyle={isWeb ? "pageSheet" : "fullScreen"}
    >
      <View style={styles.modal}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Add {mode === "quickInfo" ? "Quick Info" : "Category"}
          </Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} {...getScrollViewProps()}>
          {mode === "quickInfo" ? (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Select or create type</Text>
                {isWeb ? (
                  <TextInput
                    style={styles.input}
                    value={selectedOption}
                    onChangeText={setSelectedOption}
                    placeholder="Enter or select type"
                    placeholderTextColor={theme.colors.placeholder}
                  />
                ) : (
                  <View style={styles.picker}>
                    <Picker
                      selectedValue={selectedOption}
                      onValueChange={setSelectedOption}
                    >
                      <Picker.Item label="Select type..." value="" />
                      {predefinedQuickInfoOptions.map((option) => (
                        <Picker.Item
                          key={option}
                          label={option}
                          value={option}
                        />
                      ))}
                    </Picker>
                  </View>
                )}
              </View>

              {selectedOption === "Custom..." && (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Custom panel name</Text>
                  <TextInput
                    style={styles.input}
                    value={customName}
                    onChangeText={setCustomName}
                    placeholder="Enter custom name"
                    placeholderTextColor={theme.colors.placeholder}
                  />
                </View>
              )}

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Information</Text>
                <MarkdownField
                  value={value}
                  onChange={setValue}
                  placeholder="Enter the information to display"
                  height={150}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Privacy Level</Text>
                <View style={styles.privacyContainer}>
                  {privacyLevels.map((level) => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.privacyButton,
                        privacyLevel === level && styles.privacyButtonActive,
                      ]}
                      onPress={() => setPrivacyLevel(level)}
                    >
                      <Text
                        style={[
                          styles.privacyButtonText,
                          privacyLevel === level &&
                            styles.privacyButtonTextActive,
                        ]}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          ) : (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Category name</Text>
                <TextInput
                  style={styles.input}
                  value={categoryName}
                  onChangeText={setCategoryName}
                  placeholder="Enter category name"
                  placeholderTextColor={theme.colors.placeholder}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Category Color</Text>
                <View style={styles.colorGrid}>
                  {defaultColors.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorSwatch,
                        { backgroundColor: color },
                        categoryColor === color && styles.colorSwatchSelected,
                      ]}
                      onPress={() => setCategoryColor(color)}
                    />
                  ))}
                  <TouchableOpacity
                    style={styles.customColorButton}
                    onPress={() => setShowColorPicker(!showColorPicker)}
                  >
                    <Text style={styles.customColorText}>+</Text>
                  </TouchableOpacity>
                </View>

                {showColorPicker && (
                  <View style={styles.colorPickerRow}>
                    {isWeb && (
                      <input
                        type="color"
                        value={categoryColor}
                        onChange={(e) => setCategoryColor(e.target.value)}
                        style={{
                          width: 60,
                          height: 40,
                          border: `1px solid ${theme.colors.border}`,
                          borderRadius: 4,
                          cursor: "pointer",
                        }}
                      />
                    )}
                    <TextInput
                      style={[styles.input, styles.colorInput]}
                      value={categoryColor}
                      onChangeText={setCategoryColor}
                      placeholder="#000000"
                      placeholderTextColor={theme.colors.placeholder}
                    />
                  </View>
                )}

                <View
                  style={[styles.preview, { backgroundColor: categoryColor }]}
                >
                  <Text style={styles.previewText}>
                    Preview: {categoryName || "Category Name"}
                  </Text>
                </View>
              </View>
            </>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleClose}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              styles.addButton,
              !isValid && styles.addButtonDisabled,
            ]}
            onPress={handleAdd}
            disabled={!isValid}
          >
            <Text style={styles.addButtonText}>
              Add {mode === "quickInfo" ? "Quick Info" : "Category"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
