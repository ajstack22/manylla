import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
} from "react-native";
import { QuickInfoConfig, CategoryConfig } from "../../types/ChildProfile";

interface UnifiedAddDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "quickInfo" | "category";
  onAdd: (data: Partial<QuickInfoConfig> | Partial<CategoryConfig>) => void;
  existingItems?: QuickInfoConfig[] | CategoryConfig[];
}

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

const privacyLevels = [
  { value: "private", label: "Private" },
  { value: "family", label: "Family" },
  { value: "medical", label: "Medical" },
  { value: "education", label: "Education" },
  { value: "all", label: "All" },
];

export const UnifiedAddDialog: React.FC<UnifiedAddDialogProps> = ({
  open,
  onClose,
  mode,
  onAdd,
  existingItems = [],
}) => {
  // Quick Info state
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [customName, setCustomName] = useState("");
  const [value, setValue] = useState("");
  const [privacyLevel, setPrivacyLevel] = useState<string>("all");
  const [showOptionPicker, setShowOptionPicker] = useState(false);

  // Category state
  const [categoryName, setCategoryName] = useState("");
  const [categoryColor, setCategoryColor] = useState("#3498DB");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customColor, setCustomColor] = useState("#3498DB");

  const handleReset = () => {
    setSelectedOption("");
    setCustomName("");
    setValue("");
    setPrivacyLevel("all");
    setCategoryName("");
    setCategoryColor("#3498DB");
    setShowColorPicker(false);
    setShowOptionPicker(false);
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
        } as Partial<QuickInfoConfig>);
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
        } as Partial<CategoryConfig>);
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

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={open}
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoid}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
              <Text style={styles.headerButtonText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              Add {mode === "quickInfo" ? "Quick Info" : "Category"}
            </Text>
            <TouchableOpacity
              onPress={handleAdd}
              style={[
                styles.headerButton,
                !isValid && styles.headerButtonDisabled,
              ]}
              disabled={!isValid}
            >
              <Text
                style={[
                  styles.headerButtonText,
                  styles.headerButtonAdd,
                  !isValid && styles.headerButtonTextDisabled,
                ]}
              >
                Add
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {mode === "quickInfo" ? (
              <View>
                {/* Quick Info Type Selection */}
                <View style={styles.section}>
                  <Text style={styles.label}>Select or create type</Text>
                  <TouchableOpacity
                    style={styles.picker}
                    onPress={() => setShowOptionPicker(true)}
                  >
                    <Text style={styles.pickerText}>
                      {selectedOption || "Tap to select"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Custom Name Input */}
                {selectedOption === "Custom..." && (
                  <View style={styles.section}>
                    <Text style={styles.label}>Custom panel name</Text>
                    <TextInput
                      style={styles.input}
                      value={customName}
                      onChangeText={setCustomName}
                      placeholder="Enter custom name"
                      placeholderTextColor="#999"
                    />
                  </View>
                )}

                {/* Information Input */}
                <View style={styles.section}>
                  <Text style={styles.label}>Information</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={value}
                    onChangeText={setValue}
                    placeholder="Enter the information to display"
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={5}
                    textAlignVertical="top"
                  />
                </View>

                {/* Privacy Level */}
                <View style={styles.section}>
                  <Text style={styles.label}>Privacy Level</Text>
                  <View style={styles.privacyButtons}>
                    {privacyLevels.map((level) => (
                      <TouchableOpacity
                        key={level.value}
                        style={[
                          styles.privacyButton,
                          privacyLevel === level.value &&
                            styles.privacyButtonActive,
                        ]}
                        onPress={() => setPrivacyLevel(level.value)}
                      >
                        <Text
                          style={[
                            styles.privacyButtonText,
                            privacyLevel === level.value &&
                              styles.privacyButtonTextActive,
                          ]}
                        >
                          {level.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            ) : (
              <View>
                {/* Category Name */}
                <View style={styles.section}>
                  <Text style={styles.label}>Category name</Text>
                  <TextInput
                    style={styles.input}
                    value={categoryName}
                    onChangeText={setCategoryName}
                    placeholder="Enter category name"
                    placeholderTextColor="#999"
                  />
                </View>

                {/* Category Color */}
                <View style={styles.section}>
                  <Text style={styles.label}>Category Color</Text>
                  <View style={styles.colorGrid}>
                    {defaultColors.map((color) => (
                      <TouchableOpacity
                        key={color}
                        style={[
                          styles.colorOption,
                          { backgroundColor: color },
                          categoryColor === color && styles.colorOptionSelected,
                        ]}
                        onPress={() => setCategoryColor(color)}
                      />
                    ))}
                    <TouchableOpacity
                      style={[styles.colorOption, styles.colorOptionCustom]}
                      onPress={() => setShowColorPicker(true)}
                    >
                      <Text style={styles.colorOptionCustomText}>+</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Custom Color Input */}
                  {showColorPicker && (
                    <View style={styles.customColorContainer}>
                      <TextInput
                        style={styles.input}
                        value={customColor}
                        onChangeText={(text) => {
                          setCustomColor(text);
                          if (text.match(/^#[0-9A-Fa-f]{6}$/)) {
                            setCategoryColor(text);
                          }
                        }}
                        placeholder="#000000"
                        placeholderTextColor="#999"
                      />
                    </View>
                  )}

                  {/* Preview */}
                  <View
                    style={[styles.preview, { backgroundColor: categoryColor }]}
                  >
                    <Text style={styles.previewText}>
                      Preview: {categoryName || "Category Name"}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Option Picker Modal */}
          {showOptionPicker && (
            <Modal
              animationType="slide"
              transparent={true}
              visible={showOptionPicker}
              onRequestClose={() => setShowOptionPicker(false)}
            >
              <View style={styles.pickerModal}>
                <View style={styles.pickerModalContent}>
                  <View style={styles.pickerModalHeader}>
                    <Text style={styles.pickerModalTitle}>Select Type</Text>
                    <TouchableOpacity
                      onPress={() => setShowOptionPicker(false)}
                    >
                      <Text style={styles.pickerModalClose}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <ScrollView>
                    {predefinedQuickInfoOptions.map((option) => (
                      <TouchableOpacity
                        key={option}
                        style={styles.pickerOption}
                        onPress={() => {
                          setSelectedOption(option);
                          setShowOptionPicker(false);
                        }}
                      >
                        <Text style={styles.pickerOptionText}>{option}</Text>
                        {selectedOption === option && (
                          <Text style={styles.pickerOptionCheck}>✓</Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </Modal>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  headerButton: {
    padding: 8,
  },
  headerButtonDisabled: {
    opacity: 0.5,
  },
  headerButtonText: {
    fontSize: 16,
    color: "#007AFF",
  },
  headerButtonTextDisabled: {
    color: "#999",
  },
  headerButtonAdd: {
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  picker: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  pickerText: {
    fontSize: 16,
    color: "#333",
  },
  privacyButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  privacyButton: {
    flex: 1,
    minWidth: 70,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  privacyButtonActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  privacyButtonText: {
    fontSize: 14,
    color: "#666",
  },
  privacyButtonTextActive: {
    color: "#FFFFFF",
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: "#000",
  },
  colorOptionCustom: {
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
  },
  colorOptionCustomText: {
    fontSize: 24,
    color: "#666",
  },
  customColorContainer: {
    marginTop: 12,
  },
  preview: {
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  previewText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  pickerModal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  pickerModalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
  },
  pickerModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  pickerModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  pickerModalClose: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
  pickerOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  pickerOptionText: {
    fontSize: 16,
    color: "#333",
  },
  pickerOptionCheck: {
    fontSize: 18,
    color: "#007AFF",
    fontWeight: "600",
  },
});

export default UnifiedAddDialog;
